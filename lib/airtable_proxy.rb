require 'active_support/all'
require 'json'
require 'sinatra'
require 'airtable'

set :public_folder, File.dirname(__FILE__) + '/../public'

airtable_client = Airtable::Client.new(ENV['AIRTABLE_API_KEY'])
open_referral_base_id = ENV['AIRTABLE_BASE_ID']
services_table = airtable_client.table(open_referral_base_id, 'services')

def service_to_dict(service)
  {
    service_id: service.id,
    name: service['name'],
    organization: service['organization'],
    locations: service['locations'],
  }
end

get '/' do
  redirect to('/art_gallery.html')
end

get '/v0/services' do
  content_type :json
  {
    services: services_table.all.map {|service| service_to_dict(service)}
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
