import { Component, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';

import { Client } from '../../services/api';

@Component({
  selector: 'minds-button-answer',
  properties: ['_object: object'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="mdl-color-text--blue-grey-500" [ngClass]="{'selected': object['answers:count'] > 0 }">
      <i class="material-icons">chat_bubble</i>
      <counter *ngIf="object['answers:count'] > 0">{{object['answers:count']}}</counter>
    </a>
  `,
  directives: [CORE_DIRECTIVES]
})

export class AnswerButton {

  object;

  constructor(public client : Client) {
  }

  set _object(value : any){
    this.object = value;
  }

}
