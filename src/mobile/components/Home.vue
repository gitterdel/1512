<template>
  <Page>
    <ActionBar title="RentHub">
      <NavigationButton visibility="collapsed" />
    </ActionBar>

    <TabView androidTabsPosition="bottom">
      <!-- Explorar Tab -->
      <TabViewItem title="Explorar" ios:iconSource="res://tabIcons/home" android:iconSource="res://home">
        <StackLayout>
          <SearchBar hint="Buscar propiedades..." @textChange="onSearchTextChanged" />
          <ListView for="property in filteredProperties" @itemTap="onPropertyTap">
            <v-template>
              <PropertyCard :property="property" />
            </v-template>
          </ListView>
        </StackLayout>
      </TabViewItem>

      <!-- Favoritos Tab -->
      <TabViewItem title="Favoritos" ios:iconSource="res://tabIcons/heart" android:iconSource="res://heart">
        <StackLayout>
          <ListView for="property in savedProperties" @itemTap="onPropertyTap">
            <v-template>
              <PropertyCard :property="property" />
            </v-template>
          </ListView>
        </StackLayout>
      </TabViewItem>

      <!-- Mensajes Tab -->
      <TabViewItem title="Mensajes" ios:iconSource="res://tabIcons/message" android:iconSource="res://message">
        <StackLayout>
          <ListView for="chat in chats" @itemTap="onChatTap">
            <v-template>
              <ChatListItem :chat="chat" />
            </v-template>
          </ListView>
        </StackLayout>
      </TabViewItem>

      <!-- Perfil Tab -->
      <TabViewItem title="Perfil" ios:iconSource="res://tabIcons/user" android:iconSource="res://user">
        <ScrollView>
          <StackLayout class="profile-container">
            <Image :src="user.avatar || 'res://placeholder_avatar'" class="profile-image" />
            <Label :text="user.name" class="profile-name" />
            <Label :text="user.email" class="profile-email" />
            
            <StackLayout class="profile-stats">
              <GridLayout columns="*, *, *" class="stats-container">
                <StackLayout col="0" class="stat-item">
                  <Label :text="userStats.properties" class="stat-number" />
                  <Label text="Propiedades" class="stat-label" />
                </StackLayout>
                <StackLayout col="1" class="stat-item">
                  <Label :text="userStats.bookings" class="stat-number" />
                  <Label text="Reservas" class="stat-label" />
                </StackLayout>
                <StackLayout col="2" class="stat-item">
                  <Label :text="userStats.reviews" class="stat-number" />
                  <Label text="Reseñas" class="stat-label" />
                </StackLayout>
              </GridLayout>
            </StackLayout>

            <Button text="Editar Perfil" @tap="onEditProfile" class="edit-profile-btn" />
            <Button text="Configuración" @tap="onSettings" class="settings-btn" />
            <Button text="Cerrar Sesión" @tap="onLogout" class="logout-btn" />
          </StackLayout>
        </ScrollView>
      </TabViewItem>
    </TabView>
  </Page>
</template>

<script lang="ts">
import Vue from 'nativescript-vue';
import { PropertyCard } from './PropertyCard';
import { ChatListItem } from './ChatListItem';
import { useAuthStore } from '../../store/useAuthStore';
import { usePropertyStore } from '../../store/usePropertyStore';
import { useChatStore } from '../../store/useChatStore';

export default Vue.extend({
  name: 'Home',
  
  components: {
    PropertyCard,
    ChatListItem
  },

  data() {
    return {
      searchText: '',
      userStats: {
        properties: '0',
        bookings: '0',
        reviews: '0'
      }
    };
  },

  computed: {
    user() {
      return useAuthStore.getState().user;
    },
    filteredProperties() {
      return usePropertyStore.getState().filteredProperties;
    },
    savedProperties() {
      // Implement saved properties logic
      return [];
    },
    chats() {
      return useChatStore.getState().chats;
    }
  },

  methods: {
    onSearchTextChanged(args: any) {
      this.searchText = args.value;
      // Implement search logic
    },
    onPropertyTap(args: any) {
      const property = this.filteredProperties[args.index];
      this.$navigateTo(PropertyDetail, {
        props: { property }
      });
    },
    onChatTap(args: any) {
      const chat = this.chats[args.index];
      this.$navigateTo(ChatDetail, {
        props: { chat }
      });
    },
    onEditProfile() {
      this.$navigateTo(EditProfile);
    },
    onSettings() {
      this.$navigateTo(Settings);
    },
    onLogout() {
      useAuthStore.getState().logout();
      this.$navigateTo(Login, { clearHistory: true });
    }
  }
});
</script>

<style scoped>
.profile-container {
  padding: 20;
}

.profile-image {
  width: 100;
  height: 100;
  border-radius: 50;
  margin-bottom: 10;
}

.profile-name {
  font-size: 24;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5;
}

.profile-email {
  font-size: 16;
  color: #666;
  text-align: center;
  margin-bottom: 20;
}

.profile-stats {
  margin: 20 0;
}

.stats-container {
  background-color: #f8f9fa;
  border-radius: 10;
  padding: 15;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20;
  font-weight: bold;
  color: #4f46e5;
}

.stat-label {
  font-size: 14;
  color: #666;
}

.edit-profile-btn {
  background-color: #4f46e5;
  color: white;
  margin: 10 20;
  padding: 12;
  border-radius: 5;
}

.settings-btn {
  background-color: #f3f4f6;
  color: #374151;
  margin: 10 20;
  padding: 12;
  border-radius: 5;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  margin: 10 20;
  padding: 12;
  border-radius: 5;
}
</style>