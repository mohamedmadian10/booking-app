import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from 'src/app/_services/places.service';
import { Place } from 'src/app/_models/place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit,OnDestroy {
  offers:Place[];
  private placesSub:Subscription;
  isLoading = false;
  constructor(private placeSer:PlacesService,private router:Router) { }
  ngOnInit() {
    // this.offers = this.placeSer.places;
    this.placesSub = this.placeSer.places.subscribe(places=>{
      this.offers =places;
    })
    console.log('offers',this.offers);
  }
  ionViewWillEnter(){
    this.isLoading =true;
    this.placeSer.fetchPlaces().subscribe(()=>{
      this.isLoading =false;
    })
  }

  onEdit(id:string,ion_sliding_item:IonItemSliding){
    ion_sliding_item.close();
    this.router.navigate(['/','places','tabs','offers','edit',id])
    console.log('offer',id)
  }

  ngOnDestroy(){
    if(this.placesSub){
      this.placesSub.unsubscribe();
    }
  }

}
