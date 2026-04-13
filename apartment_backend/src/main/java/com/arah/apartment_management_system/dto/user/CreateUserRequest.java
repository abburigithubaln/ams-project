package com.arah.apartment_management_system.dto.user;

import com.arah.apartment_management_system.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {

	@NotBlank
	private String username;

	@Email
	private String email;

	@NotBlank
	private String password;

	private String contactNumber;

	private String designation;

	@NotNull
	private Role role;

	private Long flatId;

	private Long apartmentId;
}