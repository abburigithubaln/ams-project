package com.arah.apartment_management_system.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                "Not Found",
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handleBadRequest(
                        BadRequestException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "Bad Request",
                                ex.getMessage(),
                                request);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidation(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation Failed",
                                message,
                                request);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.FORBIDDEN,
                                "Forbidden",
                                "Access Denied",
                                request);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneric(
                        Exception ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Internal Server Error",
                                ex.getMessage(),
                                request);
        }

        private ResponseEntity<ErrorResponse> buildResponse(
                        HttpStatus status,
                        String error,
                        String message,
                        HttpServletRequest request) {

                ErrorResponse response = new ErrorResponse(
                                LocalDateTime.now(),
                                status.value(),
                                error,
                                message,
                                request.getRequestURI());

                return new ResponseEntity<>(response, status);
        }
}
