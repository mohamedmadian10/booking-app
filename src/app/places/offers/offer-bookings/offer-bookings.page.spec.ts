import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OfferBookingsPage } from './offer-bookings.page';

describe('OfferBookingsPage', () => {
  let component: OfferBookingsPage;
  let fixture: ComponentFixture<OfferBookingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferBookingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OfferBookingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
