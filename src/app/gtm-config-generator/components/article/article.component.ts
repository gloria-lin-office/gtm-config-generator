import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-article',
  standalone: true,
  template: `<div class="article">
    <h1>GTM Config Generator</h1>
    <div class="article__purpose">
      <p>
        The main purpose of the GTM Configuration JSON Generator is to save
        users' time and increase their productivity by automating the GTM
        configuration process. By offering an intuitive interface for JSON file
        creation and management, the app streamlines the workflow, reduces the
        margin for human error, and ensures the generation of accurate and
        optimized GTM configuration files. This is especially beneficial for
        digital marketers, web developers, and SEO experts who need to manage
        and track multiple website tags, enabling them to focus more on data
        analysis and less on the technicalities of tag management.
      </p>
    </div>
    <div class="article__usage">
      <h1>Usage</h1>
      <p>The expected input is an array of objects:</p>
      <pre>{{ exampleInput | json }}</pre>
      <div></div>
      <p>
        Note that the dollar sign "$" is intended to be referring to variables,
        in the current specs. Please add the dollar sign "$" to the beginning of
        the value.
      </p>
    </div>
    <h1>Automatically Included Tags</h1>
    <div class="article__default-setting">
      <p>
        In an effort to further streamline your Google Tag Manager
        configuration, our GTM Configuration JSON Generator automatically
        includes 'Video' and 'Scroll' tags in the output. This means you won't
        need to manually set these commonly used tags, saving you valuable time
        and ensuring consistent tracking across your digital properties. Now,
        tracking user interaction with videos and scroll activities on your
        website becomes even more effortless! Rest assured, our tool is designed
        to make your tag management as efficient and effective as possible.
      </p>
    </div>
  </div> `,
  styles: [],
  imports: [CommonModule],
})
export class ArticleComponent {
  exampleInput = [
    {
      event: 'begin_checkout',
      ecommerce: {
        value: '$value',
        currency: '$currency',
        order_source: '$order_source',
        shipping_tier: '$shipping_tier',
        items: [
          {
            item_brand: '$item1.item_brand',
            item_id: '$item1.item_id',
            item_name: '$item1.item_name',
            item_category: '$item1.item_category',
            item_category2: '$item1.item_category2',
            item_category3: '$item1.item_category3',
            item_category4: '$item1.item_category4',
            item_category5: '$item1.item_category5',
            currency: '$item1.currency',
            discount: '$item1.discount',
            price: '$item1.value',
            quantity: '$item1.quantity',
            coupon: '$item1.coupon',
            index: '$item1.index',
            item_variant: '$item1.$item_variant',
          },
        ],
      },
    },
  ];
}
