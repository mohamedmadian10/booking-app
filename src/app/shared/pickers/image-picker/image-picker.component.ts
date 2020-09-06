import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Input,
} from "@angular/core";
import {
  Plugins,
  Capacitor,
  CameraResultType,
  CameraSource,
} from "@capacitor/core";
import { Platform } from "@ionic/angular";

@Component({
  selector: "app-image-picker",
  templateUrl: "./image-picker.component.html",
  styleUrls: ["./image-picker.component.scss"],
})
export class ImagePickerComponent implements OnInit {
  selectedImage: string;
  @Output() pickImage = new EventEmitter<string | File>();
  @Input() showPreview = false;
  usePicker = false;
  @ViewChild("filePicker") filePickerRef: ElementRef<HTMLInputElement>;
  constructor(private platform: Platform) {}

  ngOnInit() {
    console.log("mobile", this.platform.is("mobile"));
    console.log("hybrid", this.platform.is("hybrid"));
    console.log("ios", this.platform.is("ios"));
    console.log("android", this.platform.is("android"));
    console.log("desktop", this.platform.is("desktop"));
    if (
      (this.platform.is("mobile") && !this.platform.is("hybrid")) ||
      this.platform.is("desktop")
    ) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable("Camera")) {
      this.filePickerRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      source: CameraSource.Prompt,
      quality: 50,
      correctOrientation: true,
      width: 200,
      height:320,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    })
      .then((image) => {
        this.selectedImage = "data:image/jpeg;base64, " + image.base64String;
        this.pickImage.emit("data:image/jpeg;base64, " + image.base64String);
      })
      .catch((error) => {
        console.log(error);
        if (this.usePicker) {
          this.filePickerRef.nativeElement.click();
        }
        return false;
      });
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.pickImage.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }
}
