# frozen_string_literal: true

# All customer/operator lifecycle emails. Delivery via SMTP (Mailpit) or AWS SES.
class TransactionalMailer < ApplicationMailer
  # --- Auth ---
  def welcome(user:, organization:)
    @user = user
    @organization = organization
    @cta_url = app_url(organization.organization_type == "drone_operator" ? "/operator" : "/app")
    mail(to: user.email, subject: "Bem-vindo ao DroneHub")
  end

  def password_reset(user:, token:)
    @user = user
    @cta_url = app_url("/reset-password?token=#{token}")
    mail(to: user.email, subject: "Redefinir sua senha — DroneHub")
  end

  def email_verification(user:, token:)
    @user = user
    @cta_url = app_url("/verify-email?token=#{token}")
    mail(to: user.email, subject: "Confirme seu e-mail — DroneHub")
  end

  # --- Mission / marketplace ---
  def mission_published(user:, mission:)
    @user = user
    @mission = mission
    @cta_url = app_url("/app/missions/#{mission.id}")
    mail(to: user.email, subject: "Missão publicada: #{mission.title}")
  end

  def job_invite(user:, mission:, operator_profile:)
    @user = user
    @mission = mission
    @operator_profile = operator_profile
    @cta_url = app_url("/operator/jobs")
    mail(to: user.email, subject: "Novo job na sua área: #{mission.title}")
  end

  def quote_received(user:, mission:, quote:)
    @user = user
    @mission = mission
    @quote = quote
    @cta_url = app_url("/app/missions/#{mission.id}/quotes")
    mail(to: user.email, subject: "Nova proposta em “#{mission.title}”")
  end

  def quote_accepted(user:, mission:, quote:, order:)
    @user = user
    @mission = mission
    @quote = quote
    @order = order
    @cta_url = app_url(
      user_is_operator?(user, order) ? "/operator/missions" : "/app/missions/#{mission.id}"
    )
    mail(to: user.email, subject: "Proposta aceita — #{mission.title}")
  end

  def payment_confirmed(user:, order:, mission:)
    @user = user
    @order = order
    @mission = mission
    @cta_url = app_url("/app/missions/#{mission.id}")
    mail(to: user.email, subject: "Pagamento confirmado — pedido #{order.id.to_s[0, 8]}")
  end

  def mission_started(user:, mission:)
    @user = user
    @mission = mission
    @cta_url = app_url("/app/missions/#{mission.id}")
    mail(to: user.email, subject: "Missão em execução: #{mission.title}")
  end

  def deliverable_ready(user:, mission:, deliverable:)
    @user = user
    @mission = mission
    @deliverable = deliverable
    @cta_url = app_url("/app/missions/#{mission.id}/deliverables")
    mail(to: user.email, subject: "Entrega pronta para revisão — #{mission.title}")
  end

  def deliverable_approved(user:, mission:, deliverable:)
    @user = user
    @mission = mission
    @deliverable = deliverable
    @cta_url = app_url("/operator/missions")
    mail(to: user.email, subject: "Entrega aprovada — #{mission.title}")
  end

  def deliverable_rejected(user:, mission:, deliverable:, reason:)
    @user = user
    @mission = mission
    @deliverable = deliverable
    @reason = reason
    @cta_url = app_url("/operator/missions")
    mail(to: user.email, subject: "Entrega rejeitada — ação necessária")
  end

  def review_received(user:, mission:, rating:)
    @user = user
    @mission = mission
    @rating = rating
    @cta_url = app_url("/operator")
    mail(to: user.email, subject: "Nova avaliação na sua conta")
  end

  def operator_verified(user:, operator_profile:)
    @user = user
    @operator_profile = operator_profile
    @cta_url = app_url("/operator")
    mail(to: user.email, subject: "Perfil verificado — você já pode receber jobs")
  end

  private

  def user_is_operator?(user, order)
    return false unless order&.operator_organization_id

    OrganizationMembership.where(
      user_id: user.id,
      organization_id: order.operator_organization_id,
      status: "active"
    ).exists?
  end
end
