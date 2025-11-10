import {Component, Input, input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader-overlay',
  templateUrl: './loader-overlay.component.html',
  styleUrls: ['./loader-overlay.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LoaderOverlayComponent {
  @Input() visible = false;
  @Input() defaultDuration = 1000;

  showfor(ms: number = this.defaultDuration) {
    if(this.visible) return;
    this.visible = true;

    setTimeout(() => this.visible = false, ms);
  }

  hide() {
    this.visible = false;
  }
}
