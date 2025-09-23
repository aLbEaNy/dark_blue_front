import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineGameComponent } from './offline-game.component';

describe('OfflineGameComponent', () => {
  let component: OfflineGameComponent;
  let fixture: ComponentFixture<OfflineGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
