require 'test_helper'

class Controller1ControllerTest < ActionDispatch::IntegrationTest
  test "should get indexAction" do
    get controller1_indexAction_url
    assert_response :success
  end

end
