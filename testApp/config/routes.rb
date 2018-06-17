Rails.application.routes.draw do
  get 'controller1/indexAction'
  resources :articles
  root 'controller1/indexAction'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
