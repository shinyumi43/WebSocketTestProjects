package com.example.WebRTCProjects.Stomp;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DrawingMessage {

    private int startX;
    private int startY;
    private int endX;
    private int endY;
    private String color;
    private int lineWidth;

    // 기본 생성자
    public DrawingMessage() {}

    // 모든 필드를 인자로 받는 생성자
    public DrawingMessage(int startX, int startY, int endX, int endY, String color, int lineWidth) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.color = color;
        this.lineWidth = lineWidth;
    }
}

