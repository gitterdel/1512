<template>
  <GridLayout rows="auto" columns="*" class="property-card">
    <StackLayout>
      <Image :src="property.images[0]" class="property-image" stretch="aspectFill" />
      <GridLayout rows="auto, auto" columns="*, auto" class="property-info">
        <Label :text="property.title" row="0" col="0" class="property-title" />
        <Label :text="'$' + property.price + '/mes'" row="0" col="1" class="property-price" />
        
        <GridLayout rows="auto" columns="auto, auto, auto" row="1" col="0" colSpan="2" class="property-features">
          <Label col="0" :text="property.location" class="location" />
          <Label col="1" :text="propertyType" class="type" />
          <Label col="2" :text="bedroomsText" class="bedrooms" v-if="property.features.bedrooms" />
        </GridLayout>
      </GridLayout>
    </StackLayout>
  </GridLayout>
</template>

<script lang="ts">
import Vue from 'vue';
import { Property } from '../../types';

export default Vue.extend({
  name: 'PropertyCard',
  
  props: {
    property: {
      type: Object as () => Property,
      required: true
    }
  },

  computed: {
    propertyType(): string {
      return this.property.type === 'house' ? 'Casa' : 'Habitación';
    },
    bedroomsText(): string {
      const bedrooms = this.property.features.bedrooms;
      return bedrooms ? `${bedrooms} hab.` : '';
    }
  }
});
</script>

<style scoped>
.property-card {
  margin: 8;
  background-color: white;
  border-radius: 10;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0 2;
  shadow-opacity: 0.25;
  shadow-radius: 3.84;
}

.property-image {
  height: 200;
  border-top-left-radius: 10;
  border-top-right-radius: 10;
}

.property-info {
  padding: 12;
}

.property-title {
  font-size: 16;
  font-weight: bold;
  color: #1f2937;
}

.property-price {
  font-size: 16;
  font-weight: bold;
  color: #4f46e5;
}

.property-features {
  margin-top: 8;
}

.location, .type, .bedrooms {
  font-size: 14;
  color: #6b7280;
  margin-right: 8;
}
</style>