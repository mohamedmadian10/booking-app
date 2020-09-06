import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PlacesService } from "src/app/_services/places.service";
import { NavController, LoadingController, AlertController } from "@ionic/angular";
import { Place } from "src/app/_models/place.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.page.html",
  styleUrls: ["./edit-offer.page.scss"],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  editOfferForm: FormGroup;
  isLoading = false;
  placeId: string;
  private editOffSub: Subscription;
  constructor(
    private arouter: ActivatedRoute,
    private placeService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loadinCtrl: LoadingController,
    private alertCtrl:AlertController
  ) {}

  ngOnInit() {
    this.arouter.paramMap.subscribe((param) => {
      if (!param.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.placeId = param.get("placeId");
      // console.log("placeId", this.placeId);
      this.isLoading = true;

      this.editOffSub = this.placeService
        .getPlaceDetails(this.placeId)
        .subscribe((place) => {
          this.place = place;
          this.editOfferForm = new FormGroup({
            title: new FormControl(this.place.title, {
              validators: [Validators.required],
            }),
            description: new FormControl(this.place.description, {
              validators: [Validators.required],
            }),
          });
          this.isLoading = false;
        },error=>{
          this.alertCtrl.create({
            header:'An error occured',
            message:'Place could not be feched,please try again later.',
            buttons:[{text:'okay',handler:()=>{
              this.router.navigate(['/places/tabs/offers'])
            }}]            
          }).then(alertEl=>{
            alertEl.present();
          })
        });
      // console.log(this.place)
    });
  }

  onEditOffer() {
    if (!this.editOfferForm.valid) {
      return;
    }
    this.loadinCtrl
      .create({
        message: "place updated.....",
      })
      .then((loadingEl) => {
        loadingEl.present();
        // console.log('this.place.id,',this.place.id)
        this.placeService
          .updatePlace(
            this.place.id,
            this.editOfferForm.value.title,
            this.editOfferForm.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.router.navigate(["/places/tabs/offers"]);
          });
        // console.log(this.editOfferForm);
      });
  }

  ngOnDestroy() {
    if (this.editOffSub) {
      this.editOffSub.unsubscribe();
    }
  }
}
