package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.enums.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;

public class MaintenanceSpecification {

    public static Specification<Maintenance> hasStatus(String status) {
        return (root, query, cb) -> {

            if (status == null || status.isEmpty()) {
                return cb.conjunction();
            }

            if (status.equalsIgnoreCase("OVERDUE")) {

                return cb.and(
                        cb.equal(root.get("paymentStatus"), PaymentStatus.PENDING),
                        cb.lessThan(root.get("dueDate"), java.time.LocalDate.now()));
            }

            return cb.equal(
                    root.get("paymentStatus"),
                    PaymentStatus.valueOf(status.toUpperCase()));
        };
    }

    public static Specification<Maintenance> hasMonth(Integer month) {
        return (root, query, criteriaBuilder) -> {
            if (month == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("month"), month);
        };
    }

    public static Specification<Maintenance> hasYear(Integer year) {
        return (root, query, criteriaBuilder) -> {
            if (year == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("year"), year);
        };
    }

    public static Specification<Maintenance> hasApartmentId(Long apartmentId) {
        return (root, query, criteriaBuilder) -> {
            if (apartmentId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("flat").get("block").get("apartment").get("id"), apartmentId);
        };
    }
}
