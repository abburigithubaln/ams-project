package com.arah.apartment_management_system.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.flat.FlatRequestDTO;
import com.arah.apartment_management_system.dto.flat.FlatResponseDTO;
import com.arah.apartment_management_system.service.FlatService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/flats")
@RequiredArgsConstructor
public class FlatController {

    private final FlatService flatService;

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FlatResponseDTO>> createFlat(
            @Valid @RequestBody FlatRequestDTO request) {

        FlatResponseDTO response = flatService.createFlat(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Flat created successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FlatResponseDTO>>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        ApiResponse<PageResponse<FlatResponseDTO>> response =
                flatService.getAllFlats(search, pageable);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlatResponseDTO>> getById(
            @PathVariable Long id) {

        FlatResponseDTO flat = flatService.getFlatById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Flat fetched successfully", flat)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlatResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody FlatRequestDTO request) {

        FlatResponseDTO updated = flatService.updateFlat(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Flat updated successfully", updated)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        flatService.deleteFlat(id);

        return ResponseEntity.ok(
                ApiResponse.success("Flat deleted successfully", null)
        );
    }
}
