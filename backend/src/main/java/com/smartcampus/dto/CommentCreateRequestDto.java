package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentCreateRequestDto {

    @NotBlank(message = "Comment text is required")
    private String text;
}
