import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Place } from 'src/app/_models/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-booking-create',
  templateUrl: './booking-create.component.html',
  styleUrls: ['./booking-create.component.scss'],
})
export class BookingCreateComponent implements OnInit {
@Input() selectePlace:Place;
@Input() selecteMode:'selectd'|'random';
startDate:string;
endDate:string;
@ViewChild('cbForm') form:NgForm;
  constructor(private modalCtrl:ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectePlace.availableFrom);
    const availableTo = new Date(this.selectePlace.availableTo);
    //selecting random date between start and end date
    if(this.selecteMode ==="random"){
      this.startDate = new Date(
        availableFrom.getTime() +
         Math.random() *
         (availableTo.getTime() -
         //deductone one week because in the end date there will be 7 days to choose
          7 *24 * 60 * 60 *1000 - 
          availableFrom.getTime())
      ).toISOString()

      this.endDate =
        new Date(new Date(this.startDate).getTime() + 
        Math.random() *
         (new Date(this.startDate).getTime()+
         6 * 24 *60 *60 *1000 - 
         new Date(this.startDate).getTime())
       ).toISOString()
       
        
    }
  }
  onCancel(){
    this.modalCtrl.dismiss(null,'cancel')
  }
  datesValidate(){
    if(this.form){
      const startDate= new Date(this.form.value['dateFrom']);
      const endtDate= new Date(this.form.value['dateTo']);
      return endtDate > startDate; 
  
    }
    }
  onBook(){
    
    if(!this.form.valid || !this.datesValidate){
      return;
    }
  this.modalCtrl.dismiss({bookingData:{
    firstName:this.form.value['firstName'],
    lastName:this.form.value['lastName'],
    guestNumbers:+this.form.value['guestNumber'],
    startDate:new Date(this.form.value['dateFrom']),
    endDate: new Date(this.form.value['dateTo']),

  }}, 'confirm')
  }
}
