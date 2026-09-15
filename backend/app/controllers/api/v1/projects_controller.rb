# frozen_string_literal: true

module Api
  module V1
    class ProjectsController < BaseController
      def index
        authorize authorize_context, Projects::Project
        projects = policy_scope(authorize_context, Projects::Project).active.order(updated_at: :desc)
        render_data(projects.map { |p| serialize(p) })
      end

      def show
        project = TenantScope.find!(Projects::Project, params[:id], organization: current_organization)
        authorize authorize_context, project
        render_data(serialize(project))
      end

      def create
        authorize authorize_context, Projects::Project
        project = Projects::Project.new(
          organization: current_organization,
          created_by: current_user,
          name: params.require(:name),
          description: params[:description],
          industry: params[:industry],
          status: "active"
        )
        if project.save
          render_data(serialize(project), status: :created)
        else
          render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: project.errors.full_messages.join(", "))
        end
      end

      def update
        project = TenantScope.find!(Projects::Project, params[:id], organization: current_organization)
        authorize authorize_context, project
        if project.update(params.permit(:name, :description, :industry, :external_reference))
          render_data(serialize(project))
        else
          render_error(status: 422, code: "VALIDATION", title: "Invalid", detail: project.errors.full_messages.join(", "))
        end
      end

      def archive
        project = TenantScope.find!(Projects::Project, params[:id], organization: current_organization)
        authorize authorize_context, project, :archive?
        project.archive!
        render_data(serialize(project))
      end

      private

      def serialize(p)
        {
          id: p.id,
          name: p.name,
          description: p.description,
          industry: p.industry,
          status: p.status,
          updated_at: p.updated_at
        }
      end
    end
  end
end
