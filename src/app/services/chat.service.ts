import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class ChatService {
  constructor(public db: AngularFireDatabase) {}
  sendMessage(id: string, message: string, user: any, offset: any) {
    this.db.list('/chats/ ' + id + '/').push({
      text: message,
      time: Date.now() + offset,
      user: {
        name: user.displayName,
        photo: user.photoURL,
        uid: user.uid
      }
    });
  }
  getMessages(id: string) {
    return this.db.list('/chats/ ' + id).snapshotChanges();
  }
}
