import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../_services/booking.service';
import { Booking } from '../_models/bookings.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit,OnDestroy {
loadedBookings:Booking[]=[];
bookingSub:Subscription;
isLoading =false;
  constructor(private bookingsService:BookingService,private loadingCtrl:LoadingController) { }

  ngOnInit() {
    this.bookingSub =this.bookingsService.bookings.subscribe(bookings=>{
      this.loadedBookings =bookings;
    });
    console.log(this.loadedBookings)
  }
  ionViewWillEnter(){
    this.isLoading =  true;
    this.bookingsService.fechBookings().subscribe(()=>{
      this.isLoading = false;
    })
  }

  onCancelBooking(bookingId:string,bookItem:IonItemSliding){
    bookItem.close();
    this.loadingCtrl.create({
      message:'cancelling booking...'
    }).then(loadingEl=>{
      loadingEl.present();
      this.bookingsService.cancelBooking(bookingId).subscribe(()=>{
        loadingEl.dismiss();
      });

    })
  
  }
  ngOnDestroy(){
    if(this.bookingSub){
      this.bookingSub.unsubscribe();
    }
  }

}
