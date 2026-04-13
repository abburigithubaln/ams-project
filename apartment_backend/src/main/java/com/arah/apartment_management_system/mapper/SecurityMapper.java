package com.arah.apartment_management_system.mapper;

import com.arah.apartment_management_system.dto.security.ParcelDTO;
import com.arah.apartment_management_system.dto.security.VehicleDTO;
import com.arah.apartment_management_system.dto.security.VisitorDTO;
import com.arah.apartment_management_system.entity.Parcel;
import com.arah.apartment_management_system.entity.Vehicle;
import com.arah.apartment_management_system.entity.Visitor;
import org.springframework.stereotype.Component;

@Component
public class SecurityMapper {

    public VisitorDTO toVisitorDTO(Visitor v) {
        return VisitorDTO.builder()
                .id(v.getId())
                .name(v.getName())
                .phone(v.getPhone())
                .flatNumber(v.getFlatNumber())
                .purpose(v.getPurpose())
                .status(v.getStatus())
                .entryTime(v.getEntryTime())
                .exitTime(v.getExitTime())
                .otp(v.getOtp())
                .isPreApproved(v.isPreApproved())
                .build();
    }

    public ParcelDTO toParcelDTO(Parcel p) {
        return ParcelDTO.builder()
                .id(p.getId())
                .recipientName(p.getRecipientName())
                .flatNumber(p.getFlatNumber())
                .courier(p.getCourier())
                .trackingNumber(p.getTrackingNumber())
                .status(p.getStatus())
                .receivedTime(p.getReceivedTime())
                .collectedTime(p.getCollectedTime())
                .build();
    }

    public VehicleDTO toVehicleDTO(Vehicle v) {
        return VehicleDTO.builder()
                .id(v.getId())
                .vehicleNumber(v.getVehicleNumber())
                .vehicleType(v.getVehicleType())
                .ownerName(v.getOwnerName())
                .flatNumber(v.getFlatNumber())
                .status(v.getStatus())
                .entryTime(v.getEntryTime())
                .exitTime(v.getExitTime())
                .build();
    }
}
