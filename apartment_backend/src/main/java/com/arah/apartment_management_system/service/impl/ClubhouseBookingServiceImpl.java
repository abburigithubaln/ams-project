package com.arah.apartment_management_system.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingRequest;
import com.arah.apartment_management_system.dto.clubhouse.ClubhouseBookingResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.ClubhouseBooking;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.SystemSetting;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.BookingStatus;
import com.arah.apartment_management_system.enums.ClubhouseSlot;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.mapper.ClubhouseMapper;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.ClubhouseBookingRepository;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.SystemSettingRepository;
import com.arah.apartment_management_system.service.ClubhouseBookingService;
import com.arah.apartment_management_system.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ClubhouseBookingServiceImpl implements ClubhouseBookingService {

    private final ClubhouseBookingRepository clubhouseBookingRepository;
    private final AllotmentRepository allotmentRepository;
    private final UserService userService;
    private final SystemSettingRepository systemSettingRepository;
    private final FlatRepository flatRepository;
    private final ClubhouseMapper clubhouseMapper;

    @Override
    public ClubhouseBookingResponse createBooking(ClubhouseBookingRequest request) {
        User user = userService.getLoggedInUser();

        Flat flat;
        User bookingUser = user;
        if (request.getFlatId() != null) {
            flat = flatRepository.findById(request.getFlatId())
                    .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
            if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_SUPER_ADMIN) {
                bookingUser = allotmentRepository.findByFlatAndStatus(flat, AllotmentStatus.ACTIVE)
                        .map(Allotment::getUser)
                        .orElse(user);
            }
        } else {
            flat = allotmentRepository
                    .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                    .map(Allotment::getFlat)
                    .orElse(null);
        }

        if (flat == null) {
            throw new IllegalArgumentException("Flat ID is required for clubhouse booking");
        }

        ClubhouseSlot slot = request.getSlot() != null ? request.getSlot() : ClubhouseSlot.DAY;

        boolean slotTaken = clubhouseBookingRepository
                .findByOccasionDateAndSlotAndStatusIn(
                        request.getOccasionDate(),
                        slot,
                        List.of(BookingStatus.PENDING, BookingStatus.APPROVED))
                .isPresent();

        if (slotTaken) {
            String slotLabel = slot == ClubhouseSlot.DAY ? "Day" : "Night";
            throw new IllegalArgumentException(
                    "The " + slotLabel + " slot on " + request.getOccasionDate() +
                            " is already booked. Please choose a different date or slot.");
        }

        Integer maxCapacity = getMaxCapacity();
        if (maxCapacity != null) {
            if (request.getCapacity() == null) {
                throw new IllegalArgumentException("Capacity must be specified. Max allowed is " + maxCapacity);
            }
            if (request.getCapacity() > maxCapacity) {
                throw new IllegalArgumentException(
                        "Requested capacity exceeds maximum allowed capacity of " + maxCapacity);
            }
        }

        ClubhouseBooking booking = new ClubhouseBooking();
        booking.setName(request.getName());
        booking.setUser(bookingUser);
        booking.setFlat(flat);
        booking.setOccasionType(request.getOccasionType());
        booking.setOccasionDate(request.getOccasionDate());
        booking.setSlot(slot);
        booking.setCapacity(request.getCapacity());
        booking.setRoomsForGuests(request.getRoomsForGuests());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setStatus(user.getRole() == Role.ROLE_ADMIN ? BookingStatus.APPROVED : BookingStatus.PENDING);

        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public List<ClubhouseBookingResponse> getMyBookings() {
        User user = userService.getLoggedInUser();

        Flat flat = allotmentRepository
                .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                .map(Allotment::getFlat)
                .orElse(null);

        if (flat != null) {
            return clubhouseBookingRepository.findByUserOrFlatOrderByCreatedAtDesc(user, flat)
                    .stream()
                    .map(clubhouseMapper::toDTO)
                    .collect(Collectors.toList());
        } else {
            return clubhouseBookingRepository.findByUserOrderByCreatedAtDesc(user)
                    .stream()
                    .map(clubhouseMapper::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<ClubhouseBookingResponse> getAllBookings(LocalDate startDate, LocalDate endDate) {
        User user = userService.getLoggedInUser();
        Long aptId = user.getManagedApartment() != null ? user.getManagedApartment().getId() : null;
        boolean isSuperAdmin = user.getRole() == Role.ROLE_SUPER_ADMIN;

        if (startDate != null && endDate != null) {
            if (isSuperAdmin || aptId == null) {
                return clubhouseBookingRepository.findByOccasionDateBetween(startDate, endDate)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            } else {
                return clubhouseBookingRepository.findByOccasionDateBetweenAndApartmentId(startDate, endDate, aptId)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            }
        } else if (startDate != null) {
            if (isSuperAdmin || aptId == null) {
                return clubhouseBookingRepository.findByOccasionDateGreaterThanEqual(startDate)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            } else {
                return clubhouseBookingRepository.findByOccasionDateGreaterThanEqualAndApartmentId(startDate, aptId)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            }
        } else if (endDate != null) {
            if (isSuperAdmin || aptId == null) {
                return clubhouseBookingRepository.findByOccasionDateLessThanEqual(endDate)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            } else {
                return clubhouseBookingRepository.findByOccasionDateLessThanEqualAndApartmentId(endDate, aptId)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            }
        } else {
            if (isSuperAdmin || aptId == null) {
                return clubhouseBookingRepository.findAllByOrderByCreatedAtDesc()
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            } else {
                return clubhouseBookingRepository.findByApartmentIdOrderByCreatedAtDesc(aptId)
                        .stream().map(clubhouseMapper::toDTO).collect(Collectors.toList());
            }
        }
    }

    @Override
    public ClubhouseBookingResponse updateStatus(Long bookingId, BookingStatus status) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(status);
        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public ClubhouseBookingResponse updateBooking(Long id, ClubhouseBookingRequest request) {
        User user = userService.getLoggedInUser();
        ClubhouseBooking booking = clubhouseBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (user.getRole() != Role.ROLE_ADMIN && user.getRole() != Role.ROLE_SUPER_ADMIN) {
            boolean ownsBooking = booking.getUser().getId().equals(user.getId());
            boolean ownsFlat = false;
            if (booking.getFlat() != null) {
                Flat flat = allotmentRepository
                        .findByUserAndStatus(user, AllotmentStatus.ACTIVE)
                        .map(Allotment::getFlat)
                        .orElse(null);
                if (flat != null && flat.getId().equals(booking.getFlat().getId())) {
                    ownsFlat = true;
                }
            }
            if (!ownsBooking && !ownsFlat) {
                throw new RuntimeException("You are not authorized to update this booking");
            }
        }

        ClubhouseSlot newSlot = request.getSlot() != null ? request.getSlot() : booking.getSlot();

        boolean dateOrSlotChanged = !booking.getOccasionDate().equals(request.getOccasionDate())
                || booking.getSlot() != newSlot;

        if (dateOrSlotChanged) {
            boolean slotTaken = clubhouseBookingRepository
                    .findByOccasionDateAndSlotAndStatusIn(
                            request.getOccasionDate(),
                            newSlot,
                            List.of(BookingStatus.PENDING, BookingStatus.APPROVED))
                    .filter(existing -> !existing.getId().equals(id))
                    .isPresent();

            if (slotTaken) {
                String slotLabel = newSlot == ClubhouseSlot.DAY ? "Day" : "Night";
                throw new IllegalArgumentException(
                        "The " + slotLabel + " slot on " + request.getOccasionDate() +
                                " is already booked. Please choose a different date or slot.");
            }
        }

        booking.setName(request.getName());
        booking.setOccasionType(request.getOccasionType());
        booking.setOccasionDate(request.getOccasionDate());
        booking.setSlot(newSlot);

        Integer maxCapacity = getMaxCapacity();
        if (maxCapacity != null) {
            if (request.getCapacity() == null) {
                throw new IllegalArgumentException("Capacity must be specified. Max allowed is " + maxCapacity);
            }
            if (request.getCapacity() > maxCapacity) {
                throw new IllegalArgumentException(
                        "Requested capacity exceeds maximum allowed capacity of " + maxCapacity);
            }
        }

        if (request.getCapacity() != null) {
            booking.setCapacity(request.getCapacity());
        }
        if (request.getRoomsForGuests() != null)
            booking.setRoomsForGuests(request.getRoomsForGuests());
        booking.setSpecialRequests(request.getSpecialRequests());

        if (user.getRole() != Role.ROLE_ADMIN) {
            booking.setStatus(BookingStatus.PENDING);
        }

        return clubhouseMapper.toDTO(clubhouseBookingRepository.save(booking));
    }

    @Override
    public void deleteBooking(Long id) {
        ClubhouseBooking booking = clubhouseBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        clubhouseBookingRepository.delete(booking);
    }

    @Override
    public Integer getMaxCapacity() {
        return systemSettingRepository.findById("CLUBHOUSE_MAX_CAPACITY")
                .map(setting -> Integer.parseInt(setting.getSettingValue()))
                .orElse(null);
    }

    @Override
    public Integer setMaxCapacity(Integer capacity) {
        SystemSetting setting = systemSettingRepository.findById("CLUBHOUSE_MAX_CAPACITY")
                .orElse(new SystemSetting("CLUBHOUSE_MAX_CAPACITY", ""));
        setting.setSettingValue(String.valueOf(capacity));
        systemSettingRepository.save(setting);
        return capacity;
    }
}
