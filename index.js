import Component from 'can-component';
import stache from 'can-stache';
import route from 'can-route';
import 'can-stache-route-helpers';

// Home component
Component.extend({
    tag: 'home-page',
    view: `
      <h1>Home Page</h1>
      <p>Latest Post:</p>
      <li>{{items.title}}</li>
    `,
    ViewModel: {
        page: 'string',
        itemsPromise: {
            get() {
                console.log('doing fetch itemsPromise');
                return fetch('https://jsonplaceholder.typicode.com/posts/1')
                    .then(response => response.json())
            }
        },
        items: {
            get(val, set) {
                this.itemsPromise.then(set);
            }
        }
    }
});


// Home component
Component.extend({
    tag: 'other-page',
    view: `
      <h1>Other Page</h1>
      <p>Latest Post:</p>
      <li>{{items.title}}</li>
    `,
    ViewModel: {
        page: 'string',
        itemsPromise: {
            get() {
                console.log('doing fetch itemsPromise');
                return fetch('https://jsonplaceholder.typicode.com/posts/5')
                    .then(response => response.json())
            }
        },
        items: {
            get(val, set) {
                this.itemsPromise.then(set);
            }
        }
    }
});

// App component
Component.extend({
    tag: 'the-app',
    view: `current page: {{page}}<hr />
       <div class="container">
  
      {{#each(flatComponentProps)}}
        <a href="{{routeUrl(page=id)}}">{{title}}</a> | 
      {{/each}}
      
      {{#if(activeComponentProps)}}
        {{#if (activeComponentProps.path)}}
                {{#unless(activeComponentProps.forbidden(session.user)) }}
                    {{>activeComponentTemplate}}
                {{else}}
                    {{!-- forbidden! --}}
                    <br />
                    <div class="empty" style="margin: auto; auto; height:400px; width: 600px;">
                    <div class="empty-icon">
                        <i class="fa fa-3x fa-frown-o"></i>
                    </div>
                    <p class="empty-title h5">Oops! That page is forbidden</p>
                    <p class="empty-subtitle">You might want to tell someone about it</p>
                    <div class="empty-action">
                        {{!-- <button class="btn btn-primary">Send a message</button> --}}
                    </div>
                    </div>
                {{/unless}}
        {{else}}
            <br />
            <div class="empty" style="margin: auto; auto; height:400px; width: 600px;">
            <div class="empty-icon">
                <i class="fa fa-3x fa-frown-o"></i>
            </div>
            <p class="empty-title h5">Oops! That page wasn't found</p>
            <p class="empty-subtitle">You might want to tell someone about it</p>
            <div class="empty-action">
                <button class="btn btn-primary">Send a message</button>
            </div>
            </div>
        {{/if}}
      {{else}}
        <div class="loading loading-lg">Loading</div>
      {{/if}}
  
    </div>
    `,
    ViewModel: {
        componentProps: {
            default(){
                return [{
                id: 'home',
                tag: 'home-page',
                title: 'Home',
                path: 'would/be/path/to-import'
            }, {
                id: 'other',
                tag: 'other-page',
                title: 'Other',
                path: 'would/be/path/to-import'
            }]
        },
            serialize: false
        },
        flatComponentProps: {
            get() {
                return this.componentProps.reduce((links, link) => {
                    if (link.children) {
                        links = links.concat(link.children);
                    } else {
                        links.push(link);
                    }
                    return links;
                }, []);
            }
        },

        page: {
            type: 'string',
            default: 'home',
            serialize(page) {
                return page || undefined;
            }
        },
        activeComponentProps: {
            get() {
                const pageId = this.page;
                const filtered = this.flatComponentProps.filter(comp => {
                    return pageId === comp.id;
                });
                return filtered[0] || {};
            },
            serialize: false
        },
        activeComponentTemplate: {
            get() {
                const comp = this.activeComponentProps;
                if (comp.tag) {
                    return stache(`
                <${comp.tag} ${comp.attributes || ''} />
          `);
                }
                return null;
            },
            serialize: false
        },
    }
});

// Routing
route.register('{page}', {
    page: 'home'
});
route.data = document.querySelector('the-app');
route.start();