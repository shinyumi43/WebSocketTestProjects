package com.example.WebRTCProjects.WebSocket;

import com.example.WebRTCProjects.WebSocket.Message;
import com.example.WebRTCProjects.WebSocket.Utils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class WebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    //WebSocket 연결
    @Override
    public void afterConnectionEstablished(WebSocketSession session){
        var sessionId = session.getId();
        sessions.put(sessionId, session); //Session 저장

        Message message = Message.builder().sender(sessionId).receiver("all").build();
        message.newConnect();

        sessions.values().forEach(s -> {
            try{
                if(!s.getId().equals(sessionId)){
                    s.sendMessage(new TextMessage(Utils.getString(message)));
                }
            } catch (Exception e){
                //TODO : Throw
            }
        });
    }
    //양방향 데이터 통신
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Message message = Utils.getObject(textMessage.getPayload());
        message.setSender(session.getId());

        WebSocketSession receiver = sessions.get(message.getReceiver()); //메시지 전달 상대를 찾음

        if(receiver != null && receiver.isOpen()){
            receiver.sendMessage(new TextMessage(Utils.getString(message))); //상대가 존재하고 연결된 상태일 경우, 메시지 전송
        }
    }
    //Socket 연결 종료
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status){
        var sessionId = session.getId();

        sessions.remove(sessionId); //session 저장소에 연결이 끊긴 사용자를 삭제

        final Message message = new Message();
        message.closeConnect();
        message.setSender(sessionId);

        sessions.values().forEach(s -> {
            try {
                s.sendMessage(new TextMessage(Utils.getString(message))); //다른 사용자들에게 접속이 끊김을 전달
            } catch (Exception e) {
                //TODO : throw
            }
        });
    }
    //Socket 통신 오류
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception){
        //TODO : throw
    }
}
