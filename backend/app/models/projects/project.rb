# frozen_string_literal: true

module Projects
  class Project < ApplicationRecord
    self.table_name = "projects"

    belongs_to :organization
    belongs_to :created_by, class_name: "User"
    has_many :missions, class_name: "Missions::Mission", dependent: :restrict_with_exception

    validates :name, presence: true, length: { maximum: 180 }
    validates :status, inclusion: { in: %w[active archived] }

    scope :active, -> { where(status: "active") }

    def archive!
      update!(status: "archived")
    end
  end
end
