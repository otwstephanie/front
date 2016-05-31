import { Component, View, EventEmitter} from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { RouterLink } from "angular2/router";

import { Client } from '../../../services/api';
import { SessionFactory } from '../../../services/session';
import { AutoGrow } from '../../../directives/autogrow';
import { BUTTON_COMPONENTS } from '../../../components/buttons';
import { TagsPipe } from '../../../pipes/tags';
import { MINDS_PIPES } from '../../../pipes/pipes';

import { MDL_DIRECTIVES } from '../../../directives/material';
import { AttachmentService } from '../../../services/attachment';

import { MindsVideo } from '../../../components/video';

import { ReportModal } from '../../../components/modal/modal';

@Component({
  selector: 'minds-card-answer',
  viewProviders: [ ],
  inputs: ['object', 'parent'],
  outputs: [ '_delete: delete', '_saved: saved'],
  host: {
    '(keydown.esc)': 'editing = false'
  },
  templateUrl: 'src/controllers/cards/object/answer.html',
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, BUTTON_COMPONENTS, MDL_DIRECTIVES, AutoGrow, RouterLink, MindsVideo, ReportModal ],
  pipes: [ TagsPipe, MINDS_PIPES ],
  bindings: [ AttachmentService ]
})

export class AnswerCard {

  comment : any;
  answer: any;
  editing : boolean = false;
  minds = window.Minds;
  session = SessionFactory.build();

  canPost: boolean = true;
  triedToPost: boolean = false;
  inProgress: boolean = false;

  _delete: EventEmitter<any> = new EventEmitter();
  _saved: EventEmitter<any> = new EventEmitter();

  reportToggle: boolean = false;

	constructor(public client: Client, public attachment: AttachmentService){
	}

  set object(value: any) {
    if(!value)
      return;
    this.answer = value;
    this.attachment.load(this.comment);
  }

  set _editing(value : boolean){
    this.editing = value;
  }

  save(){
    if (!this.answer.description && !this.attachment.has()) {
      return;
    }

    let data = this.attachment.exportMeta();
    data['answer'] = this.answer.description;

    this.editing = false;
    this.inProgress = true;
    this.answer.post('api/v1/answers/update/' + this.answer.guid, data)
    .then((response : any) => {
      this.inProgress = false;
      if (response.answer) {
        this._saved.next({
          answer: response.answer
        });
      }
    })
    .catch(e => {
      this.inProgress = false;
    });
  }

  applyAndSave(control: any, e) {
    e.preventDefault();

    if (this.inProgress || !this.canPost) {
      this.triedToPost = true;
      return;
    }

    this.answer.description = control.value;
    this.save();
  }

  cancel(control: any, e) {
    e.preventDefault();

    if (this.inProgress) {
      return;
    }

    this.editing = false;
    control.value = this.answer.description;
  }

  delete(){
    this.answer.delete('api/v1/answer/' + this.answer.guid);
    this._delete.next(true);
  }

  uploadAttachment(file: HTMLInputElement) {
    this.canPost = false;
    this.triedToPost = false;

    this.attachment.upload(file)
    .then(guid => {
      this.canPost = true;
      this.triedToPost = false;
      file.value = null;
    })
    .catch(e => {
      console.error(e);
      this.canPost = true;
      this.triedToPost = false;
      file.value = null;
    });
  }

  removeAttachment(file: HTMLInputElement) {
    this.canPost = false;
    this.triedToPost = false;

    this.attachment.remove(file).then(() => {
      this.canPost = true;
      this.triedToPost = false;
      file.value = "";
    }).catch(e => {
      console.error(e);
      this.canPost = true;
      this.triedToPost = false;
    });
  }

  getPostPreview(message){
    if (!message.value) {
      return;
    }

    this.attachment.preview(message.value);
  }
}
