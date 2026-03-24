package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketStatusUpdateRequestDto {
    @NotBlank(message = "Status is required")
    private String status;
}
