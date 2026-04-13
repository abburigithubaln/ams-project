package com.arah.apartment_management_system.dto.staff;

import lombok.Data;

@Data
public class CreateStaffRequest {

    private String username;
    private String email;
    private String password;
    private String contactNumber;
    private String designation;
}
