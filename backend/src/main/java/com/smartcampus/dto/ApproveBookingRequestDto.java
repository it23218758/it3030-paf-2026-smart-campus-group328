package com.smartcampus.dto;

import lombok.Data;

@Data
public class ApproveBookingRequestDto {
    private String status = "APPROVED";
    private String rejectionReason;
}
