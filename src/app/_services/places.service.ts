import { Injectable } from "@angular/core";
import { Place } from "../_models/place.model";
import { AuthService } from "./auth.service";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, delay, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: "root",
})
export class PlacesService {
  // [
  //   new Place(
  //     "A1",
  //     "luxor",
  //     `'World's greatest open-air Museum'.`,
  //     "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/b3/07/25.jpg",
  //     75,
  //     new Date("2020-08-01"),
  //     new Date("2025-12-31"),
  //     "abc"
  //   ),
  //   new Place(
  //     "A2",
  //     "Alexandria",
  //     `'World's greatest open-air city'.`,
  //     "https://www.egypttoday.com/images/larg/56747.jpg",
  //     55,
  //     new Date("2020-08-01"),
  //     new Date("2025-12-31"),
  //     "abc"
  //   ),
  //   new Place(
  //     "A3",
  //     "sharm-el-sheikh",
  //     `Sharm El Sheikh a magnet for divers and eco-tourists.`,
  //     "https://media-cdn.tripadvisor.com/media/photo-s/19/bc/d4/96/rixos-sharm-el-sheikh.jpg",
  //     55,
  //     new Date("2020-08-01"),
  //     new Date("2025-12-31"),
  //     "abc"
  //   ),
  // ]
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authSer: AuthService, private http: HttpClient) {}
  //return subscribable subject
  get places() {
    return this._places.asObservable();
  }

  //fetch places
  fetchPlaces() {
    return this.authSer.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<{ [key: string]: PlaceData }>(
          `https://ionic-booking-8190d.firebaseio.com/offer-places.json?auth=${token}`
        );
      }),
      map((resData) => {
        const Places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            Places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId
              )
            );
          }
        }
        return Places;
        // return []
      }),
      tap((places) => {
        this._places.next(places);
      })
      //   tap(resData=>{
      //   console.log(resData);
      // })
    );
  }
  //return an observable which we can subscribe
  getPlaceDetails(placeId: string) {
    //take(1) => to get my  list of places .....
    // and take(1) means that it will gives us the latest list not the future updated
    // map() => to return a single place ,
    // map as a second operator means that map now will get what take gives us.
    // return this.places.pipe(
    //   take(1),
    //   map((places) => {
    //     return { ...places.find((p) => p.id === placeId) };
    //   })
    // );
    return this.authSer.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<PlaceData>(
          `https://ionic-booking-8190d.firebaseio.com/offer-places/${placeId}.json?auth=${token}`
        );
      }),
      map((resData) => {
        return new Place(
          placeId,
          resData.title,
          resData.description,
          resData.imageUrl,
          resData.price,
          new Date(resData.availableFrom),
          new Date(resData.availableTo),
          resData.userId
        );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append("image", image);
    return this.authSer.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          "https://us-central1-ionic-booking-8190d.cloudfunctions.net/storeImage",
          uploadData,
          { headers: { Authorization: "Bearer " + token } }
        );
      })
    );
  }

  //adding place method
  addPlace(
    title: string,
    description: string,
    price: number,
    availableFrom: Date,
    availableTo: Date,
    imageUrl: string
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newPlace: Place;
    return this.authSer.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authSer.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchedUserId) {
          throw new Error("no user id found!");
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          availableFrom,
          availableTo,
          fetchedUserId
        );
        return this.http.post<{ name: string }>(
          `https://ionic-booking-8190d.firebaseio.com/offer-places.json?auth=${token}`,
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  //updating place method;
  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;
    return this.authSer.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        // console.log("oldPlace.id", oldPlace);
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-booking-8190d.firebaseio.com/offer-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );

    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     // debugger;
    //     const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
    //     const updatedPlaces = [...places];
    //     const oldPlace = updatedPlaces[updatedPlaceIndex];
    //     // console.log("oldPlace.id", oldPlace);
    //     updatedPlaces[updatedPlaceIndex] = new Place(
    //       oldPlace.id,
    //       title,
    //       description,
    //       oldPlace.imageUrl,
    //       oldPlace.price,
    //       oldPlace.availableFrom,
    //       oldPlace.availableTo,
    //       oldPlace.userId
    //     );
    // this._places.next(updatedPlaces);
    // })
    // );
  }
}
