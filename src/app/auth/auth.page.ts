import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  // loginMode ='login';
  loginState =true;
  constructor(private authService:AuthService,private router:Router,private loadingCtrl:LoadingController) { }

  ngOnInit() {
  }

  switchMode(){
      this.loginState = !this.loginState;
      // this.loginMode ="sign up"
  }
  onLogin(){
    this.isLoading =true;
    this.authService.login();
    this.loadingCtrl.create({keyboardClose:true, message:'Logging in..'}).then(loadEl=>{
      loadEl.present()
    })
    setTimeout(()=>{
      this.isLoading =false;
      this.loadingCtrl.dismiss()
    this.router.navigate(['/places/tabs/discover']);
      
    },1500)

  }
  onSubmit(form:NgForm){
    if(!form.valid){
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email,password);
    if(this.loginState){
      //send a request to login server
    }else{
      //send a request to a signup server
    }
  }
}
