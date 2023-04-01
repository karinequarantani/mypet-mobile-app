import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pet-form',
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss'],
})
export class PetFormComponent implements OnInit, AfterViewInit {

  @Input()
  public pet = null;

  @Input()
  public showDeleteButton = false;

  @Input()
  public closeModal: () => void;

  public currentDate = new Date().toISOString()
  public loadingTracker = false;

  public form = new FormGroup({});

  private currentTypeAnimal;
  private currentTypeSex;


  constructor(private http: HttpClient,
    private router: Router) { }

  ngOnInit() {

    this.form = new FormGroup({
      breed: new FormControl(this.pet?.breed || 'canina'),
      gender: new FormControl(this.pet?.gender || 'masculino'),
      name: new FormControl(this.pet?.name || ''),
      specie: new FormControl(this.pet?.specie || ''),
      vaccines: new FormControl(this.pet?.vaccinas || []),
      medicaments: new FormControl(this.pet?.medicaments || []),
      birthday: new FormControl(this.pet?.birthday || this.currentDate)
    });

  }

  ngAfterViewInit(){
    this.currentTypeAnimal = this.pet?.breed || 'canina';
    this.currentTypeSex = this.pet?.gender || 'masculino';

    this.addClassSelected(`#radio-${this.currentTypeAnimal}`);
    this.addClassSelected(`#radio-sex-${this.currentTypeSex}`);
  }

  public save() {
    this.loadingTracker = true;
    let observable: Observable<any>;

    let body = { ...this.form.value,
                    tutorId: environment.TUTOR_ID };
    
    body.birthday = body.birthday.split('T')[0]

    observable = this.pet?.id
      ? this.http.patch(`pets/${this.pet.id}`, body)
      : this.http.put('pets', body);

    observable.subscribe(
      (res) => {
        if (!!this.closeModal) return this.closeModal();
        
        this.pet = null;

        this.router.navigate(['home','my-pets']);

      },
      (error) => console.log(error),
      () => this.loadingTracker = false
    );
  }

  public remove() {
    this.loadingTracker = true;

    this.http.delete(`delete-by-id/${this.pet._id}`).subscribe(
      (res) => {
        if (!!this.closeModal) this.closeModal();
      },
      (error) => console.log(error),
      () => this.loadingTracker = false
    );
  }

  private addClassSelected = (id: string) => {
    document.querySelector(id).classList.value = '';
    document.querySelector(id).classList.value = 'selected';
  }

  public changeTypeAnimal(event) {
    event.currentTarget.querySelector(`#radio-${this.currentTypeAnimal}`).classList.remove('selected');
    event.currentTarget.querySelector(`#radio-${event.detail?.value}`).classList.add('selected');
    this.currentTypeAnimal = event.detail?.value;
  }

  public changeTypeSex(event) {
    event.currentTarget.querySelector(`#radio-sex-${this.currentTypeSex}`).classList.remove('selected');
    event.currentTarget.querySelector(`#radio-sex-${event.detail?.value}`).classList.add('selected');
    this.currentTypeSex = event.detail?.value;
  }

}
