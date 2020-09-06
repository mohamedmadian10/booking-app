import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from 'src/app/_services/places.service';
import { Place } from 'src/app/_models/place.model';
import { IonSegment } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

  constructor(private placesSer:PlacesService,private authSer:AuthService) { }
  loadedPlaces:Place[] = [];
  releventPlaces:Place[] = [];
  isLoading =false;

  private placesSub:Subscription;
  ngOnInit() {
   this.placesSub = this.placesSer.places.subscribe(places=>{
      this.loadedPlaces =places;
      this.releventPlaces = this.loadedPlaces;
    })
    // this.places = this.placesSer.places;
    console.log('places',this.loadedPlaces);

  }
   ionViewWillEnter(){
     this.isLoading = true;
     this.placesSer.fetchPlaces().subscribe(()=>{
       this.isLoading =false;
     });
   }
  onFilter(event:CustomEvent<IonSegment>){
    console.log(event.detail);
    if(event.detail.value==="all"){
      this.releventPlaces = this.loadedPlaces;
    }else{
      this.releventPlaces = this.loadedPlaces.filter(p=>p.userId !== this.authSer.userId)

    }

  }

  ngOnDestroy() {
    if(this.placesSub){
      this.placesSub.unsubscribe();
    }
    
  }

}
