package com.arah.apartment_management_system.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String contactNumber;
    private String role;
    private String status;
    private String designation;
    private String flatNumber;
    private String blockName;
    private String profilePictureUrl;
    private String aadharUrl;
    private String panCardUrl;
    private Long managedApartmentId;
    private String managedApartmentName;
}