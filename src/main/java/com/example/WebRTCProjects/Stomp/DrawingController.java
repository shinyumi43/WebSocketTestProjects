package com.example.WebRTCProjects.Stomp;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class DrawingController {

    @MessageMapping("/drawing") // 클라이언트에서 "/app/drawing"으로 데이터를 보내면 이 메서드가 호출
    @SendTo("/topic/public") // "/topic/public" 주제를 구독하는 모든 클라이언트에 데이터를 브로드캐스트
    public DrawingMessage sendDrawing(DrawingMessage drawingMessage) {
        return drawingMessage;
    }
}

