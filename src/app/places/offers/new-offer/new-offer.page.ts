import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PlacesService } from "src/app/_services/places.service";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data, contentType) {
  contentType = contentType || "";
  const sliceSize = 1024;
  const byteCharacters = window.atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
@Component({
  selector: "app-new-offer",
  templateUrl: "./new-offer.page.html",
  styleUrls: ["./new-offer.page.scss"],
})
export class NewOfferPage implements OnInit {
  newOfferForm: FormGroup;
  constructor(
    private placesSer: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.newOfferForm = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      price: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      image: new FormControl(null),
    });
  }

  onImagePick(imageData: string | File) {
    
    let imageFile;
    if (typeof imageData === "string") {
      try {
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
        console.log('imageFile', imageFile)
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }  

    this.newOfferForm.patchValue({ image: imageFile });
  }

  onCreateOffer() {
    if (!this.newOfferForm.valid || !this.newOfferForm.get("image").value) {
      return;
    }
    console.log(this.newOfferForm.value);
    this.loadingCtrl
      .create({
        message: "create offer...",
      })
      .then((loadingEl) => {
        //show loading spinner here
        loadingEl.present();
        this.placesSer.uploadImage(this.newOfferForm.get('image').value).pipe(switchMap(uploadedRes=>{
          return this.placesSer
          .addPlace(
            this.newOfferForm.value.title,
            this.newOfferForm.value.description,
            +this.newOfferForm.value.price,
            new Date(this.newOfferForm.value.dateFrom),
            new Date(this.newOfferForm.value.dateTo),
            uploadedRes.imageUrl
          )
        
        }))
       
          .subscribe(() => {
            //hide loading spinner here;
            loadingEl.dismiss();
            this.newOfferForm.reset();
            console.log(this.placesSer.places);
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }
}
