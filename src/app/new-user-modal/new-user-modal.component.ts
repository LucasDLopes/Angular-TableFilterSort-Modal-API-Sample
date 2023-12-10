import { Component, ViewEncapsulation, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

import { ModalServiceComponent } from '../Services/modal-service/modal-service.component';

@Component({
  selector: 'modal',
  templateUrl: 'new-user-modal.component.html',
  styleUrls: ['new-user-modal.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class NewUserModalComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  isOpen = false;
  private element: any;

  constructor(private modalService: ModalServiceComponent, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    //on component instantiation, call modalService to display self
    this.modalService.add(this);
    document.body.appendChild(this.element);

    // close modal on background click
    //this.element.addEventListener('click', (el: any) => {
    //  if (el.target.className === 'modal') {
    //    this.close();
    //  }
    //});
  }

  ngOnDestroy() {
    // remove self from modal service, remove itself from element
    this.modalService.remove(this);
    this.element.remove();
  }

  open() {
    this.element.style.display = 'block';
    document.body.classList.add('modal-open');
    this.isOpen = true;
  }

  close() {
    this.element.style.display = 'none';
    document.body.classList.remove('modal-open');
    this.isOpen = false;
  }
}
