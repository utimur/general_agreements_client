<template>
    <v-app id="inspire">
        <v-navigation-drawer
            v-model="drawer"
            app
            clipped
            temporary
            @click.stop="drawer = !drawer"
        >
            <v-list dense>
                <v-list-item>
                    <v-list-item-action>
                        <v-icon color="primary">mdi-account</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{$keycloak.fullName}}
                        </v-list-item-title>
                        <v-list-item-subtitle>{{$keycloak.userName}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <template v-for="(item,i) in items">
                    <v-list-item :key="i" v-if="!item.children"
                                 active-class="highlighted"
                                 :class="item.route === $route.path ? 'highlighted' : ''"
                                 @click="item.route !== $route.path ? router_push(item.route) : null"
                    >
                        <v-list-item-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ item.text }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-group
                        v-else
                        :key="i"
                        :prepend-icon="item.icon"
                    >
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title>{{item.text}}</v-list-item-title>
                            </v-list-item-content>
                        </template>

                        <v-list-item
                            v-for="(sub_item, j) in item.children"
                            :key="j"
                            @click="sub_item.route !== $route.path ? router_push(sub_item.route) : null"
                        >
                            <v-list-item-action>
                                <v-icon></v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ sub_item.text }}
                                </v-list-item-title>
                            </v-list-item-content>

                            <v-list-item-action>
                                <v-icon>{{ sub_item.icon }}</v-icon>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list-group>
                </template>

                <v-list-item
                    v-if="$keycloak.authenticated"
                    @click="$keycloak.logoutFn"
                >
                    <v-list-item-action>
                        <v-icon>exit_to_app</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            Выход
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
            app
            clipped-left
            color="primary"
            dense
        >
            <v-app-bar-nav-icon
                @click.stop="drawer = !drawer"
                color="white"
            ></v-app-bar-nav-icon>
            <v-toolbar-title class="text-white"></v-toolbar-title>
        </v-app-bar>
        <v-main>
            <v-container fluid>
                <router-view/>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
    export default {
        name: "cargo",
        data() {
            return {
                drawer: false
            }
        },
        methods: {
            router_push(route) {
                this.drawer = false;
                this.$router.push(route)
            },
        },
        computed: {
            items() {
                return this.$store.getters.navigationItems
            },
        }


    };
</script>
<style>
    .text-white {
        color: white;
    }

    .show-on-top {
        z-index: 999999;
    }

    .highlighted {
        background: #C0C0C0;
    }

</style>
