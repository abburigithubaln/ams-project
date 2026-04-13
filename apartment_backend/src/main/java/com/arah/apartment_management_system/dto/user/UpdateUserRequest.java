package com.arah.apartment_management_system.dto.user;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String contactNumber;
    private String role;
    private String status;
    private String password;
    private String profilePictureUrl;
    private String aadharUrl;
    private String panCardUrl;
    private Long apartmentId;
}
