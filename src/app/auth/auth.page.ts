import { AuthResData } from './../_services/auth.service';
import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { Router } from "@angular/router";
import { LoadingController, AlertController } from "@ionic/angular";
import { NgForm } from "@angular/forms";
import { Observable } from 'rxjs';

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  isLoading = false;
  loginState = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertctrl: AlertController
  ) {}

  ngOnInit() {}

  switchMode() {
    this.loginState = !this.loginState;
  }
  authenticate(email: string, password: string) {
    this.isLoading = true;
    let authObs:Observable<AuthResData>;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Logging in.." })
      .then((loadEl) => {
        loadEl.present();
        if(this.loginState){
         authObs = this.authService.login(email,password)
        }else{
          authObs = this.authService.signup(email, password)
        }
        authObs.subscribe((resData) => {
          console.log(resData);
          this.isLoading = false;
          loadEl.dismiss();
          this.router.navigate(["/places/tabs/discover"]);
        },err=>{
          loadEl.dismiss();
          const code = err.error.error.message;
          let message = 'could not sign you up, please try again.';
          if(code ==="EMAIL_EXISTS"){
            message ="This E-mail already exists."    
          }else if(code ==="EMAIL_NOT_FOUND"){
            message ="This E-mail could not be found."
          }else if(code ==="INVALID_PASSWORD"){
            message ="This passwird is not correct ."
          }
          this.showAlert(message);
        });
      });
  }
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);
    this.authenticate(email, password);
  }

  private showAlert(message: string) {
    this.alertctrl
      .create({
        header: "Authentication failed",
        message: message,
        buttons: ["Okay"],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }
}
