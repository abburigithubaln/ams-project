package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.enums.PaymentMethod;
import com.arah.apartment_management_system.enums.PaymentStatus;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.service.EmailService;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.arah.apartment_management_system.dto.maintenance.CreateMaintenanceRequest;
import com.arah.apartment_management_system.dto.maintenance.MaintenanceResponseDTO;
import com.arah.apartment_management_system.dto.maintenance.UpdateMaintenanceRequest;
import com.arah.apartment_management_system.service.MaintenanceService;
import com.arah.apartment_management_system.util.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

        private final MaintenanceService maintenanceService;
        private final AllotmentRepository allotmentRepository;
        private final EmailService emailService;

        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping
        public ApiResponse<String> createMaintenance(@RequestBody CreateMaintenanceRequest request) {
                maintenanceService.createBill(
                                request.getFlatId(),
                                request.getAmount(),
                                request.getMonth(),
                                request.getYear());
                return ApiResponse.success("Maintenance bill created", null);
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'SECURITY')")
        @GetMapping
        public ApiResponse<List<MaintenanceResponseDTO>> getAllMaintenance(
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) Integer month,
                        @RequestParam(required = false) Integer year,
                        Pageable pageable) {
                return ApiResponse.success(
                                "Maintenance fetched successfully",
                                maintenanceService.getAllMaintenance(status, month, year, pageable).getData()
                                                .getContent());
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{id}")
        public ApiResponse<String> updateMaintenance(
                        @PathVariable Long id,
                        @RequestBody UpdateMaintenanceRequest request) {
                maintenanceService.updateMaintenance(id, request.getAmount(), request.getMonth(), request.getYear());
                return ApiResponse.success("Maintenance updated", null);
        }

        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/{id}")
        public ApiResponse<String> deleteMaintenance(@PathVariable Long id) {
                maintenanceService.deleteMaintenance(id);
                return ApiResponse.success("Maintenance deleted", null);
        }

        @PreAuthorize("hasAnyRole('ADMIN','SECURITY')")
        @GetMapping("/current/{flatId}")
        public ApiResponse<MaintenanceResponseDTO> getCurrentMaintenance(@PathVariable Long flatId) {
                return ApiResponse.success(
                                "Current maintenance fetched successfully",
                                maintenanceService.getCurrentMaintenance(flatId));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PutMapping("/{id}/mark-paid")
        public ApiResponse<MaintenanceResponseDTO> markMaintenanceAsPaid(
                        @PathVariable Long id,
                        @RequestParam PaymentMethod paymentMethod,
                        @RequestParam(required = false) String receiptUrl) {
                return ApiResponse.success("Maintenance marked as PAID",
                                maintenanceService.markAsPaid(id, paymentMethod, receiptUrl));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping("/send-reminders")
        public ApiResponse<String> sendPaymentReminders() {
                List<MaintenanceResponseDTO> all = maintenanceService
                                .getAllMaintenance(null, null, null, Pageable.unpaged())
                                .getData().getContent();

                int count = 0;
                for (MaintenanceResponseDTO m : all) {
                        if (m.getPaymentStatus() == PaymentStatus.PENDING
                                        || m.getPaymentStatus() == PaymentStatus.OVERDUE) {
                                
                                boolean sent = allotmentRepository.findByFlatIdAndStatus(m.getFlatId(), AllotmentStatus.ACTIVE)
                                                .map(allotment -> {
                                                        emailService.sendPaymentReminder(
                                                                        allotment.getUser().getEmail(),
                                                                        allotment.getUser().getUsername(),
                                                                        m.getFlatNumber(),
                                                                        m.getTotalAmount(),
                                                                        m.getDueDate() != null ? m.getDueDate().toString() : "N/A");
                                                        return true;
                                                }).orElse(false);
                                
                                if (sent) count++;
                        }
                }
                return ApiResponse.success("Payment reminders sent to " + count + " residents", null);
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping("/{id}/send-reminder")
        public ApiResponse<String> sendSinglePaymentReminder(@PathVariable Long id) {
                MaintenanceResponseDTO m = maintenanceService.getAdminMaintenanceById(id);
                if (m.getPaymentStatus() == PaymentStatus.PENDING || m.getPaymentStatus() == PaymentStatus.OVERDUE) {
                        
                        allotmentRepository.findByFlatIdAndStatus(m.getFlatId(), AllotmentStatus.ACTIVE)
                                        .ifPresentOrElse(allotment -> {
                                                emailService.sendPaymentReminder(
                                                                allotment.getUser().getEmail(),
                                                                allotment.getUser().getUsername(),
                                                                m.getFlatNumber(),
                                                                m.getTotalAmount(),
                                                                m.getDueDate() != null ? m.getDueDate().toString() : "N/A");
                                        }, () -> {
                                                throw new RuntimeException("No active resident found for Flat " + m.getFlatNumber());
                                        });

                        return ApiResponse.success("Reminder sent to Flat " + m.getFlatNumber(), null);
                }
                throw new RuntimeException("Maintenance is already paid or cancelled");
        }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/summary")
        public ApiResponse<Map<String, Object>> getPaymentSummary() {
                List<MaintenanceResponseDTO> all = maintenanceService
                                .getAllMaintenance(null, null, null, Pageable.unpaged())
                                .getData().getContent();

                long totalBills = all.size();
                long paid = all.stream().filter(m -> m.getPaymentStatus() == PaymentStatus.PAID).count();
                long pending = all.stream().filter(m -> m.getPaymentStatus() == PaymentStatus.PENDING).count();
                long overdue = all.stream().filter(m -> m.getPaymentStatus() == PaymentStatus.OVERDUE).count();
                double totalCollected = all.stream()
                                .filter(m -> m.getPaymentStatus() == PaymentStatus.PAID)
                                .mapToDouble(MaintenanceResponseDTO::getTotalAmount).sum();
                double totalOutstanding = all.stream()
                                .filter(m -> m.getPaymentStatus() != PaymentStatus.PAID)
                                .mapToDouble(MaintenanceResponseDTO::getTotalAmount).sum();
                double totalInterest = all.stream().mapToDouble(MaintenanceResponseDTO::getInterest).sum();

                Map<String, Object> summary = new HashMap<>();
                summary.put("totalBills", totalBills);
                summary.put("paid", paid);
                summary.put("pending", pending);
                summary.put("overdue", overdue);
                summary.put("totalCollected", totalCollected);
                summary.put("totalOutstanding", totalOutstanding);
                summary.put("totalInterest", totalInterest);

                return ApiResponse.success("Summary fetched", summary);
        }

        @PreAuthorize("hasRole('ADMIN')")
        @GetMapping("/report/csv")
        public ResponseEntity<byte[]> downloadFinancialReport() {
                List<MaintenanceResponseDTO> all = maintenanceService
                                .getAllMaintenance(null, null, null, Pageable.unpaged())
                                .getData().getContent();

                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                pw.println("Flat Number,Month,Year,Base Amount,Interest,Total Amount,Due Date,Paid Date,Status,Payment Method");
                for (MaintenanceResponseDTO m : all) {
                        pw.printf("\"%s\",%d,%d,%.2f,%.2f,%.2f,%s,%s,%s,%s%n",
                                        m.getFlatNumber(),
                                        m.getMonth(),
                                        m.getYear(),
                                        m.getAmount(),
                                        m.getInterest(),
                                        m.getTotalAmount(),
                                        m.getDueDate() != null ? m.getDueDate() : "",
                                        m.getPaidDate() != null ? m.getPaidDate() : "",
                                        m.getPaymentStatus(),
                                        m.getPaymentMethod() != null ? m.getPaymentMethod() : "");
                }
                pw.flush();

                byte[] csvBytes = sw.toString().getBytes();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType("text/csv"));
                headers.setContentDispositionFormData("attachment", "financial_report.csv");
                headers.setContentLength(csvBytes.length);

                return ResponseEntity.ok().headers(headers).body(csvBytes);
        }
}
