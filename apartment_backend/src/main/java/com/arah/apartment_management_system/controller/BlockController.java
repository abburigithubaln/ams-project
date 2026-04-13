package com.arah.apartment_management_system.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.arah.apartment_management_system.dto.block.BlockRequestDTO;
import com.arah.apartment_management_system.dto.block.BlockResponseDTO;
import com.arah.apartment_management_system.dto.block.UpdateBlockRequest;
import com.arah.apartment_management_system.service.BlockService;
import com.arah.apartment_management_system.util.ApiResponse;
import com.arah.apartment_management_system.util.PageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BlockResponseDTO>> createBlock(
            @Valid @RequestBody BlockRequestDTO request) {

        BlockResponseDTO response = blockService.createBlock(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Block created successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BlockResponseDTO>>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {

        ApiResponse<PageResponse<BlockResponseDTO>> response = blockService.getAllBlocks(search, pageable);

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BlockResponseDTO>> getById(
            @PathVariable Long id) {

        BlockResponseDTO block = blockService.getBlockById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Block fetched successfully", block));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        blockService.deleteBlock(id);

        return ResponseEntity.ok(
                ApiResponse.success("Block deleted successfully", null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateBlock(
            @PathVariable Long id,
            @RequestBody UpdateBlockRequest request) {

        blockService.updateBlock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Block updated successfully", null));
    }
}
