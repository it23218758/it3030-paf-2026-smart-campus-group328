package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignTechnicianRequestDto {
    @NotBlank(message = "Technician ID is required")
    private String technicianId;
}
