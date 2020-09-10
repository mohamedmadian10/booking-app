import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from "@ionic/angular";
import { Place } from "src/app/_models/place.model";
import { PlacesService } from "src/app/_services/places.service";
import { BookingCreateComponent } from "../../../bookings/booking-create/booking-create.component";
import { Subscription } from "rxjs";
import { BookingService } from "src/app/_services/booking.service";
import { AuthService } from "src/app/_services/auth.service";
import { switchMap, take } from "rxjs/operators";

@Component({
  selector: "app-place-details",
  templateUrl: "./place-details.page.html",
  styleUrls: ["./place-details.page.scss"],
})
export class PlaceDetailsPage implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private arouter: ActivatedRoute,
    private placesSer: PlacesService,
    private modalCtl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookSer: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}
  place: Place;
  isBookable = false;
  isLoading = false;
  private plaseDetailaSub: Subscription;
  ngOnInit() {
    // let id = this.arouter.snapshot.params["placeId"];
    this.arouter.paramMap.subscribe((param) => {
      if (!param.has("placeId")) {
        this.navCtrl.navigateBack("/places/tabs/discover");
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap((userId) => {
            if (!userId) {
              throw new Error("no user id found!");
            }
            fetchedUserId = userId;
            return this.placesSer.getPlaceDetails(param.get("placeId"));
          })
        )
        .subscribe(
          (place) => {
            this.place = place;
            this.isBookable = place.userId !== fetchedUserId;
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: "An error occured",
                message: "could not fech place,please try again later",
                buttons: [
                  {
                    text: "okay",
                    handler: () => {
                      this.router.navigate(["/places/tabs/discover"]);
                    },
                  },
                ],
              })
              .then((alertEl) => {
                alertEl.present();
              });
          }
        );
    });
    // this.place = this.placesSer.places.find((p) => p.id === id);
    // console.log(this.place);
  }
  onBooking() {
    // this.router.navigate(['/places/tabs/discover']);
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl
      .create({
        header: "choose action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBooking("select");
            },
          },
          {
            text: "Random Date",
            handler: () => {
              this.openBooking("random");
            },
          },
          {
            text: "cancel",
            role: "destructive",
          },
        ],
      })
      .then((actionCtrEl) => {
        actionCtrEl.present();
      });
  }

  openBooking(mode: "select" | "random") {
    console.log(mode);
    this.modalCtl
      .create({
        component: BookingCreateComponent,
        componentProps: { selectePlace: this.place, selecteMode: mode },
      })
      .then((m) => {
        m.present();
        return m.onDidDismiss();
      })
      .then((result) => {
        console.log(result.data, result.role);
        if (result.role === "confirm") {
          console.log("booked");
          this.loadingCtrl
            .create({
              message: "booking created",
            })
            .then((loadingEl) => {
              loadingEl.present();
              this.bookSer
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  result.data.bookingData.firstName,
                  result.data.bookingData.lastName,
                  result.data.bookingData.guestNumbers,
                  result.data.bookingData.startDate,
                  result.data.bookingData.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                  this.router.navigate(["/bookings"]);
                });
            });
        }
      });
  }

  ngOnDestroy() {
    if (this.plaseDetailaSub) {
      this.plaseDetailaSub.unsubscribe();
    }
  }
}
