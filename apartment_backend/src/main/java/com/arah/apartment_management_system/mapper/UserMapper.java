package com.arah.apartment_management_system.mapper;

import org.springframework.stereotype.Component;

import com.arah.apartment_management_system.dto.user.UserResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {

        String flatNumber = null;
        String blockName = null;
        String residentApartmentName = null;

        if (user.getAllotments() != null) {
            for (Allotment allotment : user.getAllotments()) {

                if (allotment.getStatus() == AllotmentStatus.ACTIVE) {

                    if (allotment.getFlat() != null) {
                        flatNumber = allotment.getFlat().getFlatNumber();

                        if (allotment.getFlat().getBlock() != null) {
                            blockName = allotment.getFlat().getBlock().getBlockName();
                            
                            if (allotment.getFlat().getBlock().getApartment() != null) {
                                residentApartmentName = allotment.getFlat().getBlock().getApartment().getName();
                            }
                        }
                    }

                    break;
                }
            }
        }

        String apartmentName = user.getManagedApartment() != null 
                ? user.getManagedApartment().getName() 
                : residentApartmentName;

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getContactNumber(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getStatus() != null ? user.getStatus().name() : "APPROVED",
                user.getDesignation(),
                flatNumber,
                blockName,
                user.getProfilePictureUrl(),
                user.getAadharUrl(),
                user.getPanCardUrl(),
                user.getManagedApartment() != null ? user.getManagedApartment().getId() : null,
                apartmentName);
    }
}
