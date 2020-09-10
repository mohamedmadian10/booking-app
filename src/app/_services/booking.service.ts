import { Injectable } from "@angular/core";
import { Booking } from "../_models/bookings.model";
import { BehaviorSubject } from "rxjs";
import { AuthService } from "./auth.service";
import { take, tap, delay, switchMap, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}
@Injectable({
  providedIn: "root",
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([
    // new Booking('abc','A1','ee1','luxor',2)
  ]);
  constructor(private authService: AuthService, private http: HttpClient) {}
  get bookings() {
    return this._bookings.asObservable();
  }

  fechBookings() {
    let fetchedUserId;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("no user id found!");
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-booking-8190d.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${fetchedUserId}" &&auth=${token}`
        );
      }),
      map((resData) => {
        const bookings = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                resData[key].placeId,
                resData[key].userId,
                resData[key].placeTitle,
                resData[key].placeImage,
                resData[key].guestNumber,
                resData[key].firstName,
                resData[key].lastName,
                new Date(resData[key].bookedFrom),
                new Date(resData[key].bookedTo)
              )
            );
          }
        }
        return bookings;
      }),
      tap((bookings) => {
        this._bookings.next(bookings);
      })
      // tap((res) => {
      //   console.log(res);
      // })
    );
  }

  //add booking()
  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumbers: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedUserId;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error("no userId found.");
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        newBooking = new Booking(
          Math.random().toString(),
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          guestNumbers,
          firstName,
          lastName,
          dateFrom,
          dateTo
        );
        return this.http.post<{ name: string }>(
          `https://ionic-booking-8190d.firebaseio.com/bookings.json?auth=${token}`,
          {
            ...newBooking,
            id: null,
          }
        );
      }),
      take(1),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  //canceling booking
  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.delete(
          `https://ionic-booking-8190d.firebaseio.com/bookings/${bookingId}.json?auth=${token}`
        );
      }),      
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        this._bookings.next(
          bookings.filter((b) => {
            b.id !== bookingId;
          })
        );
      })
    );
    // return this.bookings.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((bookings) => {
    //     this._bookings.next(
    //       bookings.filter((b) => {
    //         b.id !== bookingId;
    //       })
    //     );
    //   })
    // );
    // const bookings =[...this.bookings]
  }
}
