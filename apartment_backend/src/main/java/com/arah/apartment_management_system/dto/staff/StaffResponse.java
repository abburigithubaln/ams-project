package com.arah.apartment_management_system.dto.staff;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StaffResponse {

    private Long id;
    private String username;
    private String email;
    private String contactNumber;
    private String designation;
    private String role;
}