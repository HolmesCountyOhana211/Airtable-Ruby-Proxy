require 'active_support/all'
require 'json'
require 'sinatra'
require 'airtable'

set :public_folder, File.dirname(__FILE__) + '/../public'

airtable_client = Airtable::Client.new(ENV['AIRTABLE_API_KEY'])
open_referral_base_id = ENV['AIRTABLE_BASE_ID']
services_table = airtable_client.table(open_referral_base_id, 'services')
locations_table = airtable_client.table(open_referral_base_id,'locations')
organizations_table = airtable_client.table(open_referral_base_id,'organizations')

def service_to_dict(service)
  {
    service_id: service.id,
    name: service['name'],
    description: service['description'],
    organization: service['organization'][0],
    location: service['locations'][0],
  }
end

def location_to_dict(location)
  {
    location_id: location.id,
    name: location['name'],
    latitude: location['latitude'],
    longitude: location['longitude'],
  }
end

def organization_to_dict(organization)
  {
    organization_id: organization.id,
    name: organization['name'],
    location: organization['locations'],
    services: organization['services'],
    email: organization['email'],
    url: organization['url'],
  }
end

def find_location(location_id)
  {
    location: locations_table.find(location_id).map {|location| location_to_dict(location)}
  }
end

get '/' do
  redirect to('/services.html')
end

get '/v0/services' do
  content_type :json
  {
    services: services_table.all.map {|service| service_to_dict(service)},
    locations: locations_table.all.map {|location| location_to_dict(location)}
  }.to_json
end

get '/v0/locations' do
  content_type :json
  {
    locations: locations_table.all.map {|location| location_to_dict(location)}
  }.to_json
end

get '/v0/organizations' do
  content_type :json
  {
    organizations: organizations_table.all.map {|organization| organization_to_dict(organization)}
  }.to_json
end



#post '/v0/set_on_display' do
#  artist_id = request.params['artist_id']
#  is_on_display = request.params['on_display'] == "true"
#  updated_artist = artists_table.update_record_fields(artist_id, {'On Display?' => is_on_display})
#  content_type :json
#  {
#    artist: artist_to_dict(updated_artist)
#  }.to_json
#end
