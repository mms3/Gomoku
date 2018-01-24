import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() user: any;
  @Input() id: string;
  @Input() offset: any;
  messages: Observable<any[]>;
  constructor(public cs: ChatService) {}

  ngOnInit() {
    this.messages = this.cs.getMessages(this.id);
  }
  onSubmit(value) {
    this.cs.sendMessage(this.id, value.message, this.user, this.offset);
  }
}
