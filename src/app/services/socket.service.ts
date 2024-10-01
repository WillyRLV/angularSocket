import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private typingTimeout: any;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  onConnected(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('userConnected', (clientId: string) => {
        observer.next(clientId);
      });
    });
  }
  getSocketId(): string {
    return this.socket.id!;
  }

  onMessage(): Observable<{ clientId: string, message: string }> {
    return new Observable(observer => {
      this.socket.on('message', (data: { clientId: string, message: string }) => {
        observer.next(data);
      });
    });
  }

  typing(): void {
    // Emitimos el evento de typing al servidor
    this.socket.emit('typing', this.getSocketId());

    // Limpiamos cualquier timeout previo
    clearTimeout(this.typingTimeout);

    // Configuramos un timeout para enviar el evento de stopTyping después de 3 segundos
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  stopTyping(): void {
    // Emitir que el usuario ha dejado de escribir
    this.socket.emit('stopTyping', this.getSocketId());
  }

  onTyping(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('typing', (clientId: string) => {
        observer.next(clientId);
      });
    });
  }

  onStopTyping(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('stopTyping', (clientId: string) => {
        observer.next(clientId);
      });
    });
  }

  sendMessage(message: string): void {
    this.socket.emit('message', { clientId: this.getSocketId(), message });
  }

  onDisconnect(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('userDisconnected', (clientId: string) => {
        observer.next(clientId);
      });
    });
  }
}
