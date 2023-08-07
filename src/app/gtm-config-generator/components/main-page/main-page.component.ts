import { Component } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { FunctionalCardComponent } from '../functional-card/functional-card.component';
import { ArticleComponent } from '../article/article.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    EditorComponent,
    FunctionalCardComponent,
    ArticleComponent,
    FooterComponent,
    CommonModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
  exampleInputJson = [
    {
      event: 'begin_checkout',
      ecommerce: {
        value: '$value',
        currency: '$currency',
        order_source: '$order_source',
        shipping_tier: '$shipping_tier',
        items: [
          {
            item_brand: '$item.item_brand',
            item_id: '$item.item_id',
            item_name: '$item.item_name',
            item_category: '$item.item_category',
            item_category2: '$item.item_category2',
            item_category3: '$item.item_category3',
            item_category4: '$item.item_category4',
            item_category5: '$item.item_category5',
            currency: '$item.currency',
            discount: '$item.discount',
            price: '$item.value',
            quantity: '$item.quantity',
            coupon: '$item.coupon',
            index: '$item.index',
            item_variant: '$item.item_variant',
          },
        ],
      },
    },
  ];
}
