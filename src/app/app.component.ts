import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  messages: { clientId: string, message: string }[] = [];
  newMessage: string = '';
  typingClient: string | null = null;
  connectionMessage: string | null = null; // Para el mensaje de conexión

  private socketService = inject(SocketService);

  // Getter para acceder al socketId desde el servicio
  get socketId(): string {
    return this.socketService.getSocketId();
  }
  ngOnInit(): void {
    // Escuchar mensajes del servidor
    this.socketService.onMessage().subscribe((data) => {
      this.messages.push({ clientId: data.clientId, message: data.message });
      this.typingClient = null; // Limpiar el estado de "typing"
    });

    // Escuchar cuando alguien está escribiendo
    this.socketService.onTyping().subscribe((clientId: string) => {
      this.typingClient = clientId;
    });

    // Escuchar cuando alguien deja de escribir
    this.socketService.onStopTyping().subscribe((clientId: string) => {
      if (this.typingClient === clientId) {
        this.typingClient = null;
      }
    });

    // Escuchar cuando un cliente se desconecta
    this.socketService.onDisconnect().subscribe((clientId: string) => {
      this.messages.push({ clientId, message: 'has left the chat.' });
    });

    this.socketService.onConnected().subscribe((clientId: string) => {
      if (clientId !== this.socketId) {
        this.connectionMessage = `${clientId} has joined the chat.`;

        // Hacer que el mensaje desaparezca después de 5 segundos
        setTimeout(() => {
          this.connectionMessage = null; // Limpiar el mensaje de conexión
        }, 5000);
      }
    })
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.socketService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  onTyping(): void {
    if (this.newMessage.trim()) {
      // Emitir "typing" solo si hay texto en el input
      this.socketService.typing();
    } else {
      // Si no hay texto, detener "typing"
      this.socketService.stopTyping();
    }
  }
}
